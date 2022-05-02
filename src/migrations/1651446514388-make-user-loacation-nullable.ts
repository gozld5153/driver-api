import { MigrationInterface, QueryRunner } from "typeorm";

export class makeUserLoacationNullable1651446514388 implements MigrationInterface {
    name = 'makeUserLoacationNullable1651446514388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_15b3fe608b52f34df363512e39\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`location\` \`location\` point NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`location\` \`location\` point NOT NULL`);
        await queryRunner.query(`CREATE SPATIAL INDEX \`IDX_15b3fe608b52f34df363512e39\` ON \`users\` (\`location\`)`);
    }

}
