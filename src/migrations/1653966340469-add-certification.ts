import { MigrationInterface, QueryRunner } from "typeorm";

export class addCertification1653966340469 implements MigrationInterface {
    name = 'addCertification1653966340469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`certifications\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'admin', 'none') NOT NULL DEFAULT 'none', \`licenseNumber\` varchar(255) NOT NULL, \`imageUrl\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'rest', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, INDEX \`IDX_f586a19c805f12f686bdf6ce4a\` (\`type\`), UNIQUE INDEX \`REL_c5d9770c24adc7be0680f9bd96\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`certifications\` ADD CONSTRAINT \`FK_c5d9770c24adc7be0680f9bd963\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`certifications\` DROP FOREIGN KEY \`FK_c5d9770c24adc7be0680f9bd963\``);
        await queryRunner.query(`DROP INDEX \`REL_c5d9770c24adc7be0680f9bd96\` ON \`certifications\``);
        await queryRunner.query(`DROP INDEX \`IDX_f586a19c805f12f686bdf6ce4a\` ON \`certifications\``);
        await queryRunner.query(`DROP TABLE \`certifications\``);
    }

}
