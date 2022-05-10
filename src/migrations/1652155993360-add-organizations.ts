import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrganizations1652155993360 implements MigrationInterface {
    name = 'addOrganizations1652155993360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_c0766e5e1ed3566bff0fc79b572\``);
        await queryRunner.query(`CREATE TABLE \`organizations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`managerId\` int NULL, UNIQUE INDEX \`REL_ed5626f6c86914a5a24f3943b3\` (\`managerId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`arrivalId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`heropickUpedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`organizationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`heroPickUpedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`destinationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`places\` ADD \`organizationId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD CONSTRAINT \`FK_ed5626f6c86914a5a24f3943b3c\` FOREIGN KEY (\`managerId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_f3d6aea8fcca58182b2e80ce979\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_c1d12cbc014906be61b0ad6e660\` FOREIGN KEY (\`destinationId\`) REFERENCES \`places\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`places\` ADD CONSTRAINT \`FK_81f134c23b46d382841bd2bf14f\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organizations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`places\` DROP FOREIGN KEY \`FK_81f134c23b46d382841bd2bf14f\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_c1d12cbc014906be61b0ad6e660\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_f3d6aea8fcca58182b2e80ce979\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP FOREIGN KEY \`FK_ed5626f6c86914a5a24f3943b3c\``);
        await queryRunner.query(`ALTER TABLE \`places\` DROP COLUMN \`organizationId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`destinationId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`heroPickUpedAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`organizationId\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`heropickUpedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`arrivalId\` int NULL`);
        await queryRunner.query(`DROP INDEX \`REL_ed5626f6c86914a5a24f3943b3\` ON \`organizations\``);
        await queryRunner.query(`DROP TABLE \`organizations\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_c0766e5e1ed3566bff0fc79b572\` FOREIGN KEY (\`arrivalId\`) REFERENCES \`places\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
