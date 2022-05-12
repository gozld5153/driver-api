import { MigrationInterface, QueryRunner } from "typeorm";

export class addOffer1652341052413 implements MigrationInterface {
    name = 'addOffer1652341052413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`offer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'none') NOT NULL, \`status\` enum ('pending', 'accepted', 'rejected', 'timeout') NOT NULL DEFAULT 'pending', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`orderId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`offer\` ADD CONSTRAINT \`FK_e8100751be1076656606ae045e3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`offer\` ADD CONSTRAINT \`FK_662530fe15e07c5e6d793f67df4\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offer\` DROP FOREIGN KEY \`FK_662530fe15e07c5e6d793f67df4\``);
        await queryRunner.query(`ALTER TABLE \`offer\` DROP FOREIGN KEY \`FK_e8100751be1076656606ae045e3\``);
        await queryRunner.query(`DROP TABLE \`offer\``);
    }

}
